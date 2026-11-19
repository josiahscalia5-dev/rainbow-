"""Fit one three-dimensional washer paddle to the retained axial station and painted outline."""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt

CROP = (336,382,444,458)
TRACES = [
    [(363,396),(382,391),(411,402),(429,417)],
    [(346,423),(363,418),(404,425),(430,439)],
    [(348,426),(365,439),(406,451),(427,442)]
]


def curve(points, u):
    a,b,c,d=np.asarray(points,dtype=float)
    return (1-u)**3*a+3*(1-u)**2*u*b+3*(1-u)*u*u*c+u**3*d


def fit(reference,layout_path,outdir):
    layout=json.loads(Path(layout_path).read_text())
    cam=layout['camera']
    frame=np.array([layout['X'],layout['U'],-np.array(layout['D'])])
    eye=frame@(np.array(cam['pos'])-layout['water'])
    rotation=np.array(cam['matrixWorld']).reshape(4,4).T[:3,:3]
    tangent=np.tan(np.radians(cam['fov']/2))
    ref_size=np.array(cam['size'])
    crop_origin=np.array(CROP[:2])
    crop_size=np.array(CROP[2:])-crop_origin
    station=-layout['paddles'][2]['along']

    def point_on_ray(px,z):
        ndc=(px/ref_size-.5)*np.array([2,-2])
        ray=frame@rotation@np.array([ndc[0]*tangent*ref_size[0]/ref_size[1],ndc[1]*tangent,-1])
        return eye+ray*((z-eye[2])/ray[2])

    def paint_uv(px):
        q=(px-crop_origin)/crop_size
        return [float(q[0]),float(1-q[1])]

    stations=np.linspace(0,1,19)
    rows=[0,.16,.36,.58,.76,.83,.92,1]
    vertices=[];uv=[];faces=[]
    front_grid=[];back_grid=[]
    for back,grid in ((False,front_grid),(True,back_grid)):
        for t in rows:
            row=[]
            for u in stations:
                top,lip,base=[curve(trace,u) for trace in TRACES]
                px=top+(lip-top)*(t/.76) if t<=.76 else lip+(base-lip)*((t-.76)/.24)
                if back:
                    # The rear is tucked into the left wall. Its free tip has a rounded return.
                    inset=.095*np.sin(np.pi*u/2)**2
                    screen_point=px*(1-inset)+np.array([389.,421.])*inset
                    depth=station-.50+.06*np.cos(np.pi*u)
                    paint=lip*.25+base*.75
                else:
                    # A rounded front, a forward lip and a curved return to the shadowed underside.
                    bulge=.34*np.sin(np.pi*u)*np.sin(np.pi*t)
                    depth=station+.22+bulge+.15*np.exp(-((t-.76)/.18)**2)
                    screen_point=px
                    paint=px
                row.append(len(vertices))
                vertices.append(point_on_ray(screen_point,depth))
                uv.append(paint_uv(paint))
            grid.append(row)

    def grid_faces(grid,front):
        for j in range(len(rows)-1):
            for i in range(len(stations)-1):
                a,b,c,d=grid[j][i],grid[j][i+1],grid[j+1][i],grid[j+1][i+1]
                for tri in ((a,b,c),(b,d,c)):
                    p,q,r=[vertices[idx] for idx in tri]
                    facing=np.dot(np.cross(q-p,r-p),eye-(p+q+r)/3)>0
                    faces.append(tri if facing==front else tuple(reversed(tri)))
    grid_faces(front_grid,True)
    grid_faces(back_grid,False)
    def perimeter(grid):
        return grid[0]+[r[-1] for r in grid[1:]]+list(reversed(grid[-1][:-1]))+[r[0] for r in reversed(grid[1:-1])]
    front_edge=perimeter(front_grid);back_edge=perimeter(back_grid)
    centre=np.asarray(vertices).mean(axis=0)
    for i in range(len(front_edge)):
        j=(i+1)%len(front_edge)
        for tri in ((front_edge[i],front_edge[j],back_edge[i]),(front_edge[j],back_edge[j],back_edge[i])):
            p,q,r=[vertices[idx] for idx in tri]
            outward=np.dot(np.cross(q-p,r-p),(p+q+r)/3-centre)>0
            faces.append(tri if outward else tuple(reversed(tri)))
    outdir=Path(outdir);outdir.mkdir(parents=True,exist_ok=True)
    pos=np.array(vertices)-centre
    data={'origin':centre.round(7).tolist(),'positions':pos.round(7).ravel().tolist(),
          'uv':np.array(uv).round(7).ravel().tolist(),'indices':np.array(faces).ravel().tolist()}
    (outdir/'paddleShape07.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
    outline=[curve(TRACES[0],u) for u in stations]+[curve(TRACES[1],1)]+[curve(TRACES[2],u) for u in reversed(stations)]+[curve(TRACES[1],0)]
    source=Image.open(reference).convert('RGB').crop(CROP)
    mask=Image.new('L',source.size,0)
    ImageDraw.Draw(mask).polygon([tuple(p-crop_origin) for p in outline], fill=255)
    # Extend gold and berry edge colours across discarded pixels to keep purple wall texels out of the mip chain.
    q=np.asarray(source);nearest=distance_transform_edt(np.asarray(mask)==0,return_distances=False,return_indices=True)
    Image.fromarray(q[nearest[0],nearest[1]]).save(outdir/'paddleFace07.png')
    wall=layout['tube'];radial=np.linalg.norm(np.asarray(vertices)[:,:2]-[wall['ax'],wall['h']],axis=1)
    info={'station':station,'vertices':len(vertices),'triangles':len(faces),'radialRange':radial[[radial.argmin(),radial.argmax()]].tolist(),
          'wallRadius':wall['r'],'axialExtent':np.ptp(np.asarray(vertices)[:,2]),'contactVertices':int((radial>=wall['r']).sum()),
          'crop':list(CROP),'visibleTrace':TRACES,'nearestHiddenSurface':'Retained axial station and tray depth. Inferred rounded rear returns into the left wall.'}
    assert info['contactVertices']>0 and info['axialExtent']<1.5
    print(json.dumps(info,indent=2))
if __name__=='__main__':
    fit(*sys.argv[1:])
