"""Find whole illustrated characters before packing, without clipping at source grid lines."""
import numpy as np
from PIL import Image
from scipy import ndimage

def whole_poses(sheet,columns=4,rows=2):
    a=np.array(sheet.convert('RGBA'));height,width=a.shape[:2]
    labels,_=ndimage.label(a[:,:,3]>100,structure=np.ones((3,3)))
    areas=np.bincount(labels.ravel());boxes=ndimage.find_objects(labels)
    candidates=[[] for _ in range(rows)]
    for label,box in enumerate(boxes,1):
        if box is None or areas[label]<max(1500,width*height*.002):continue
        yy,xx=np.where(labels[box]==label)
        cy=float(np.median(yy))+box[0].start;cx=float(np.median(xx))+box[1].start
        candidates[min(rows-1,int(cy/height*rows))].append((int(areas[label]),cx,label))
    selected=[]
    for row,items in enumerate(candidates):
        assert len(items)>=columns,('Not enough whole poses',row,len(items))
        main=sorted(items,reverse=True)[:columns]
        selected.extend(label for _,_,label in sorted(main,key=lambda item:item[1]))
    assert len(set(selected))==columns*rows
    primary=set(selected);result=[]
    # A detached detail belongs to exactly one closest body.
    distance,indices=ndimage.distance_transform_edt(~np.isin(labels,selected),return_indices=True)
    nearest=labels[tuple(indices)];groups={label:[label] for label in selected}
    radius=max(3,round(min(width/columns,height/rows)*.05))
    for label,box in enumerate(boxes,1):
        if box is None or label in primary:continue
        pixels=labels[box]==label;d=distance[box][pixels]
        if len(d)==0 or d.min()>radius:continue
        owners=nearest[box][pixels][d<=d.min()+1]
        ids,counts=np.unique(owners,return_counts=True);owner=int(ids[counts.argmax()])
        if owner in groups:groups[owner].append(label)
    for label in selected:
        mask=np.isin(labels,groups[label])
        # Restore antialias pixels only; do not absorb a neighboring opaque silhouette.
        fringe=ndimage.binary_dilation(mask,iterations=2)&((labels==0)|mask)
        rgba=a.copy();rgba[:,:,3]=np.where(fringe,rgba[:,:,3],0)
        rgba[:,:,:3]=np.where(rgba[:,:,3:4]>0,rgba[:,:,:3],0)
        image=Image.fromarray(rgba);box=image.getchannel('A').getbbox();assert box
        crop=image.crop(box)
        result.append((crop,{'sourceRect':list(box),'sourcePixels':int((rgba[:,:,3]>100).sum()),'component':label}))
    return result

def pack_poses(poses,padding=20):
    # Uniform square cells are a destination only, never a source crop boundary.
    side=max(max(im.width,im.height) for im,_ in poses)+padding*2
    sheet=Image.new('RGBA',(side*4,side*2));placements=[]
    for i,(im,meta) in enumerate(poses):
        x=i%4*side+(side-im.width)//2;y=i//4*side+side-padding-im.height
        sheet.paste(im,(x,y));placements.append((x,y,im.width,im.height,meta))
    return sheet,placements
